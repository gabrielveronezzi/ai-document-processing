using System.Net.Http.Headers;
using System.Text.Json;
using Api.Data;
using Api.Models;
using Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Database")
    ?? "Host=localhost;Port=5432;Database=document_processing;Username=app;Password=app";
var uploadsPath = builder.Configuration["Storage:UploadsPath"] ?? Path.Combine(AppContext.BaseDirectory, "uploads");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddHttpClient<AiProcessingClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000");
    client.Timeout = TimeSpan.FromMinutes(2);
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
Directory.CreateDirectory(uploadsPath);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapPost("/api/documents", async (
    IFormFile file,
    AppDbContext db,
    AiProcessingClient aiClient,
    ILogger<Program> logger,
    CancellationToken cancellationToken) =>
{
    const long maxFileSize = 10 * 1024 * 1024;
    if (file.Length == 0)
        return Results.BadRequest(new { error = "The uploaded file is empty." });
    if (file.Length > maxFileSize)
        return Results.BadRequest(new { error = "PDF files must be 10 MB or smaller." });
    if (!string.Equals(Path.GetExtension(file.FileName), ".pdf", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest(new { error = "Only PDF files are supported." });

    var storedFileName = $"{Guid.NewGuid():N}.pdf";
    var storedPath = Path.Combine(uploadsPath, storedFileName);

    await using (var input = file.OpenReadStream())
    {
        var header = new byte[5];
        var bytesRead = await input.ReadAsync(header, cancellationToken);
        if (bytesRead != 5 || !header.AsSpan().SequenceEqual("%PDF-"u8))
            return Results.BadRequest(new { error = "The uploaded file does not have a valid PDF signature." });

        input.Position = 0;
        await using var output = File.Create(storedPath);
        await input.CopyToAsync(output, cancellationToken);
    }

    var document = new DocumentRecord
    {
        OriginalFileName = Path.GetFileName(file.FileName),
        StoredFileName = storedFileName,
        ContentType = "application/pdf",
        FileSize = file.Length,
        Status = DocumentStatus.Processing
    };

    db.Documents.Add(document);
    await db.SaveChangesAsync(cancellationToken);

    try
    {
        var result = await aiClient.ProcessAsync(document.Id, document.OriginalFileName, storedPath, cancellationToken);
        document.ExtractedDataJson = JsonSerializer.Serialize(result);
        document.Status = DocumentStatus.Completed;
    }
    catch (Exception exception)
    {
        logger.LogError(exception, "Document processing failed for {DocumentId}", document.Id);
        document.Status = DocumentStatus.Failed;
        document.ErrorMessage = "Document processing failed. Check the service logs for details.";
    }

    await db.SaveChangesAsync(cancellationToken);
    return Results.Created($"/api/documents/{document.Id}", DocumentResponse.From(document));
})
    .Accepts<IFormFile>("multipart/form-data")
    .Produces<DocumentResponse>(StatusCodes.Status201Created)
    .Produces(StatusCodes.Status400BadRequest);

app.MapGet("/api/documents/{id:guid}", async (Guid id, AppDbContext db, CancellationToken cancellationToken) =>
{
    var document = await db.Documents.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    return document is null ? Results.NotFound() : Results.Ok(DocumentResponse.From(document));
});

app.MapGet("/api/documents", async (AppDbContext db, CancellationToken cancellationToken) =>
{
    var documents = await db.Documents.AsNoTracking()
        .OrderByDescending(x => x.CreatedAtUtc)
        .Take(100)
        .ToListAsync(cancellationToken);
    return Results.Ok(documents.Select(DocumentResponse.From));
});

app.Run();

public partial class Program;
