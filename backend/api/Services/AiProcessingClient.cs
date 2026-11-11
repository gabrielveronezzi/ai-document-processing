using System.Net.Http.Headers;
using System.Text.Json;

namespace Api.Services;

public sealed class AiProcessingClient(HttpClient httpClient)
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<object> ProcessAsync(Guid documentId, string fileName, string filePath, CancellationToken cancellationToken)
    {
        await using var stream = File.OpenRead(filePath);
        using var form = new MultipartFormDataContent();
        using var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        form.Add(new StringContent(documentId.ToString()), "document_id");
        form.Add(fileContent, "file", fileName);

        using var response = await httpClient.PostAsync("/v1/process", form, cancellationToken);
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonSerializer.Deserialize<JsonElement>(payload, JsonOptions);
    }
}
