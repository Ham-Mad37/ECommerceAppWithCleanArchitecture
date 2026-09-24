namespace ECommerce.Domain.Entities.Categories
{
    public class Category
    {
        public Category()
        {
        }
        public Category(string name)
        {
            ValidatedName(name);
            Name = name.Trim();
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            IsActive = true;
        }
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // 
        public void ValidatedName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name is required.", nameof(name));
            if (name.Trim().Length > 100)
                throw new ArgumentException("Category name cannot exceed 100 characters", nameof(name));

        }

        public static Category Create(string name)
        {
            return new Category(name);
        }
        //behavior
        public void Rename(string name)
        {
            Name = name.Trim();
            UpdatedAt = DateTime.UtcNow;
        }
        public void Active()
        {
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Desactive()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }
        
    }
}