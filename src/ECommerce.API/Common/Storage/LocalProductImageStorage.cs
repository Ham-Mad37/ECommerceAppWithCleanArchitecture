using ECommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Options;

namespace ECommerce.API.Common.Storage;

public sealed class LocalProductImageStorage : IProductImageStorage
{
    private const string Folder = "products";

    private readonly StorageOptions _options;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly string _folderPath;

    public LocalProductImageStorage(
        IOptions<StorageOptions> options,
        IWebHostEnvironment environment,
        IHttpContextAccessor httpContextAccessor)
    {
        _options = options.Value;
        _httpContextAccessor = httpContextAccessor;

        var root = Path.GetFullPath(_options.UploadsPath, environment.ContentRootPath);
        _folderPath = Path.Combine(root, Folder);
        Directory.CreateDirectory(_folderPath);
    }

    public async Task<string> SaveAsync(Stream content, string extension, CancellationToken cancellationToken = default)
    {
        // Random name: never trust the client's file name.
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var path = Path.Combine(_folderPath, fileName);

        await using var file = new FileStream(
            path, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);
        await content.CopyToAsync(file, cancellationToken);

        return fileName;
    }

    public Task DeleteAsync(string fileName, CancellationToken cancellationToken = default)
    {
        // Path.GetFileName blocks path traversal like "..\..\secret".
        var path = Path.Combine(_folderPath, Path.GetFileName(fileName));
        if (File.Exists(path))
            File.Delete(path);

        return Task.CompletedTask;
    }

    public string GetUrl(string fileName)
    {
        var baseUrl = _options.PublicBaseUrl?.TrimEnd('/');

        if (string.IsNullOrEmpty(baseUrl))
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            baseUrl = request is null ? string.Empty : $"{request.Scheme}://{request.Host}";
        }

        return $"{baseUrl}/uploads/{Folder}/{fileName}";
    }
}