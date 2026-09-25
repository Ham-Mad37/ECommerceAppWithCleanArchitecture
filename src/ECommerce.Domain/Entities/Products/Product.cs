using ECommerce.Domain.Entities.Categories;
namespace ECommerce.Domain.Entities.Products
{
    public class Product
    {
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

        //
        public static Product Create(string name, string? description, decimal price, int stockQuantity, int categoryId)
        {
            return new Product(name, description, price, stockQuantity, categoryId);
        }
        private void ValidateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Product name is required.", nameof(name));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Product name cannot exceed 100 characters", nameof(name));
        }
        private void ValidateCatrgory(int categoryId)
        {
            if (categoryId < 0)
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
                throw new InvalidOperationException("Insufficient stock.");
            StockQuantity -= quantity;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Activate()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}