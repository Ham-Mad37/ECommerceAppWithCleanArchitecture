namespace ECommerce.Application.Common.Interfaces
{
    public interface IProductImageStorage
    {
        // Saves the stream and returns the stored file name.
        Task<string> SaveAsync(Stream content, string extension, CancellationToken cancellationToken = default);
        Task DeleteAsync(string fileName, CancellationToken cancellationToken = default);
        string GetUrl(string fileName);
    }
}