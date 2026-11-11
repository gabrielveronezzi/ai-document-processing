namespace Api.Models;

public enum DocumentStatus
{
    Processing,
    Completed,
    Failed
}

public sealed class DocumentRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/pdf";
    public long FileSize { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.Processing;
    public string? ExtractedDataJson { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed record DocumentResponse(
    Guid Id,
    string FileName,
    long FileSize,
    string Status,
    DateTime CreatedAtUtc,
    string? ExtractedDataJson,
    string? ErrorMessage)
{
    public static DocumentResponse From(DocumentRecord document) => new(
        document.Id,
        document.OriginalFileName,
        document.FileSize,
        document.Status.ToString(),
        document.CreatedAtUtc,
        document.ExtractedDataJson,
        document.ErrorMessage);
}
