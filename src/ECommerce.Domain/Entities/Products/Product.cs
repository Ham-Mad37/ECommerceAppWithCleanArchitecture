using ECommerce.Domain.Common.Exceptions;
using ECommerce.Domain.Entities.Categories;
using Microsoft.VisualBasic;
namespace ECommerce.Domain.Entities.Products
{
    public class Product
    {
        public const int MaxImages = 8;
        private readonly List<ProductImage> _images = new();
    
        private Product()
        {
        }
        private Product(string name, string description, decimal price, int stockQuantity, int categoryId)
        {
            ValidateName(name);
            ValidatePrice(price);
            ValidateStock(stockQuantity);
            ValidateCatrgory(categoryId);
            Name = name.Trim();
            Description = string.IsNullOrWhiteSpace(description)
            ? null
            : description.Trim();

            Price = price;
            StockQuantity = stockQuantity;
            CategoryId = categoryId;

            IsActive = true;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }

        public int Id { get; set; }
        public string Name { get; private set; } = null!;
        public string? Description { get; private set; } 
        public decimal Price { get; private set; }
        public int StockQuantity { get; private set; }
        public int CategoryId { get; private set; }
        public Category Category { get; private set; } = null!;
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public byte[] RowVersion { get; private set; } = null!;

        public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();
        //
      
        public static Product Create(string name, string? description, decimal price, int stockQuantity, int categoryId)
        {
            return new Product(name, description, price, stockQuantity, categoryId);
        }
        public void UpdateDetails(string name, string? description, int categoryId)
        {
            ValidateName(name);
            ValidateDescription(description);
            ValidateCatrgory(categoryId);

            Name = name.Trim();

            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();

            CategoryId = categoryId;
            UpdatedAt = DateTime.UtcNow;

        }
        public void SetStockQuantity(int quantity)
        {
            ValidateStock(quantity);
            StockQuantity = quantity;
            UpdatedAt = DateTime.UtcNow;
        }

        public ProductImage AddImage(string fileName)
        {
            if (Images.Count >= MaxImages)
                throw new DomainException($"A product can have at most {MaxImages} images.");

            var isFirst = _images.Count == 0;
            var sortOrder = isFirst ? 0 : _images.Max(i => i.SortOrder) + 1;

            var image = ProductImage.Create(fileName, isPrimary: isFirst, sortOrder);
            _images.Add(image);
            return image;
        }
        // Returns the stored file name so the caller can delete the file from storage.
        public string RemoveImage(int imageId)
        {
            var image = _images.FirstOrDefault(i => i.Id == imageId)
             ?? throw new DomainException("Image was not found on this product.");
            _images.Remove(image);

            // If the primary image was removed, promote the first remaining one.
            if (image.IsPrimary && _images.Count > 0)
                _images.OrderBy(i => i.SortOrder).First().SetPrimary(true);

            return image.FileName;

        }
        public void SetPrimaryImage(int imageId)
        {
            if (_images.All(i => i.Id != imageId))
                throw new DomainException("Image was not found on this product.");

            foreach (var image in _images)
                image.SetPrimary(image.Id == imageId);
        }

        private void ValidateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Product name is required.", nameof(name));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Product name cannot exceed 100 characters", nameof(name));
        }
        private static void ValidateDescription(string? description)
        {
            if(description is not null && description.Trim().Length>1000 )
            {
                throw new ArgumentException("Product description cannot exceed 1000 characters.", nameof(description));
            }
        }
        private void ValidateCatrgory(int categoryId)
        {
            if (categoryId <= 0)
            {
                throw new ArgumentException("Category Id must be grater than zero.", nameof(categoryId));
            }
        }

        private void ValidateStock(int stockQuantity)
        {
            if (stockQuantity < 0)
            {
                throw new ArgumentException("Stock cannot be negative.", nameof(stockQuantity));
            }
        }

        private void ValidatePrice(decimal price)
        {
            if (price < 0)
            {
                throw new ArgumentException("Price cannot be negative.", nameof(price));
            }
        }

        public void ChangePrice(decimal newPrice)
        {
            ValidatePrice(newPrice);
            Price = newPrice;
            UpdatedAt = DateTime.UtcNow;
        }
        public void IncreaseStock(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be grater than zero.", nameof(quantity));
            StockQuantity += quantity;
            UpdatedAt = DateTime.UtcNow;
        }
        public void DecreaseStock(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be grater than zero.", nameof(quantity));
            if (quantity > StockQuantity)
                throw new DomainException("Insufficient stock.");
            StockQuantity -= quantity;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Activate()
        {
            IsActive =  true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}