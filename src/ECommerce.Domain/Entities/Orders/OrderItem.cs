namespace ECommerce.Domain.Entities.Orders
{
    public class OrderItem
    {
        private OrderItem()
        {

        }
        private OrderItem(int productId, string productName, decimal unitPrice, int quantity)
        {
            if (string.IsNullOrWhiteSpace(productName))
                throw new ArgumentException("Product name is required.", nameof(productName));
            if (productId <= 0)
                throw new ArgumentException("Product id must be grater than zero.", nameof(productId));
            if (unitPrice < 0)
                throw new ArgumentException("Unit price cannot be negative.", nameof(unitPrice));
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be grater than zero.", nameof(quantity));

        }
        public int Id { get; private set; }
        public int ProductId { get; private set; }
        public int OrderId { get; private set; }
        public string ProductName { get; private set; } = null!;
        public decimal UnitPrice { get; private set; }
        public int Quantity { get; private set; }
        public decimal LineTotl => Quantity * UnitPrice;
        //
        public static OrderItem Create(int productId, string productName, int quantity, decimal unitPrice)
        {
            return new OrderItem(productId, productName, unitPrice, quantity);
        }
        
    }
}