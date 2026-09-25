namespace ECommerce.Domain.Entities.Categories
{
    public class Cart
    {
        private readonly List<CartItem> _items = new();
        private Cart()
        {

        }
        private Cart(int customerId)
        {
            if (customerId <= 0)
                throw new ArgumentException("Customer Id must be grater than zero.", nameof(customerId));
            CustomerId = customerId;
            CreatedAt = DateTime.UtcNow;
            UpdateAt = DateTime.UtcNow;
        }
        public int Id { get; private set; }
        public int CustomerId { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdateAt { get; private set; }
        public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

        //
        public static Cart Create(int customerId)
        {
            return new Cart(customerId);
        }
        public void AddItem(int productId, int quantity)
        {
            if (productId <= 0)
                throw new ArgumentException("Product Id must be grater than zero.", nameof(productId));
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be grater than zero.", nameof(quantity));
            var existingItem = _items.FirstOrDefault(x => x.ProductId == productId);
            if (existingItem is not null)
            {
                existingItem.IncreaseQuantity(quantity);
            }
            else
            {
                _items.Add(CartItem.Create(productId, quantity));
            }
            UpdateAt = DateTime.UtcNow;
        }
        public void UpdateQuantity(int productId, int quantity)
        {
            var item = _items.FirstOrDefault(x => x.ProductId == productId);
            if (item is null)
                throw new ArgumentException("Product dose not exist in cart");
            item.SetQuantity(quantity);
            UpdateAt = DateTime.UtcNow;
        }
        public void RemoveItem(int productId)
        {
            var item = _items.FirstOrDefault(x => x.ProductId == productId);
            if (item is null)
                return;
            _items.Remove(item);
            UpdateAt = DateTime.UtcNow;
        }
        public void Clear()
        {
            _items.Clear();
            UpdateAt = DateTime.UtcNow;
        }
    }
}