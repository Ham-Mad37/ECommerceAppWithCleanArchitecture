using ECommerce.Domain.Common.Exceptions;

namespace ECommerce.Domain.Entities.Products
{
    public class ProductImage
    {
        private ProductImage() { }

        public int Id { get;private set; }
        public int ProductId { get;private set; }
        public string FileName { get;private set; } = null!;
        public bool IsPrimary { get;private set; }
        public int SortOrder { get; private set; }
        public DateTime CreatedAt { get; private set; }

        // internal: images are only created through Product.AddImage
        internal static ProductImage Create(string fileName, bool isPrimary, int sortOrder)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                throw new DomainException("Image file name is required.");
            return new ProductImage
            {
                FileName = fileName,
                IsPrimary = isPrimary,
                SortOrder = sortOrder,
                CreatedAt = DateTime.UtcNow
            };
        }

        internal void SetPrimary(bool value) => IsPrimary = value;
    }
}