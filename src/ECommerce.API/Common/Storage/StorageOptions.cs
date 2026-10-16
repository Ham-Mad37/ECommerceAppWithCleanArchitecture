namespace ECommerce.API.Common.Storage;

public sealed class StorageOptions
{
    public string UploadsPath { get; set; } = "uploads";
    public string? PublicBaseUrl { get; set; }
}