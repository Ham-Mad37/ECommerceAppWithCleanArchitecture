using System.ComponentModel;

namespace ECommerce.Domain.Entities.Orders
{

    public class Order
    {
        private readonly List<OrderItem> _items = new();
        
        private Order()
        {

        }
        private Order(int customerId)
        {
            if (customerId <= 0)
                throw new ArgumentException("Customer Id must be grater than zero.", nameof(customerId));
            CustomerId = customerId;
            Status = OrderStatus.Pending;
            ShippingCost = 0;
            Discount = 0;
            SubTotal = 0;
            Total = 0;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
        
        public int Id { get; private set; }
        public int CustomerId { get; private set; }
        public OrderStatus Status { get; private set; }
        public decimal SubTotal { get; private set; }
        public decimal ShippingCost { get; private set; }
        public decimal Discount { get; private set; }
        public decimal Total { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }
        public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
        //
        public static Order Create(int customerId)
        {
            return new Order(customerId);
        }
       
       public void AddItem(int productId,string productName,decimal unitPrice,int quantity)
       {
            var item = OrderItem.Create(productId, productName, quantity, unitPrice);
            _items.Add(item);
            RecalculateTotals();
            
       }
        private void RecalculateTotals()
        {
            SubTotal = _items.Sum(x => x.LineTotl);
            Total = SubTotal + ShippingCost - Discount;
            UpdatedAt = DateTime.UtcNow;
        }
        public void SetShippingCost(decimal shippingCost)
        {
            if (shippingCost < 0)
                throw new ArgumentException("Shipping cost cannot be negative");
            ShippingCost = shippingCost;
            UpdatedAt = DateTime.UtcNow;
            RecalculateTotals();
        }
        public void SetDiscount(decimal discount)
        {
            if (discount < 0)
                throw new ArgumentException(
                    "Discount cannot be negative.",
                    nameof(discount));

            if (discount > SubTotal)
                throw new ArgumentException(
                    "Discount cannot exceed subtotal.",
                    nameof(discount));

            Discount = discount;

            RecalculateTotals();
        }
        public void Confirm()
        {
            if (Status != OrderStatus.Pending)
                throw new InvalidOperationException("Only pending orders can be confirmed.");
            Status = OrderStatus.Confirmed;
            UpdatedAt = DateTime.UtcNow;
        }
        public void StartProcessing()
        {
            if (Status != OrderStatus.Confirmed)
                throw new InvalidOperationException(
                    "Only confirmed orders can start processing.");

            Status = OrderStatus.Processing;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Ship()
        {
            if (Status != OrderStatus.Processing)
                throw new InvalidOperationException(
                    "Only processing orders can be shipped.");

            Status = OrderStatus.Shipped;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Deliver()
        {
            if (Status != OrderStatus.Shipped)
                throw new InvalidOperationException(
                    "Only shipped orders can be delivered.");

            Status = OrderStatus.Delivered;
            UpdatedAt = DateTime.UtcNow;
        }
        public void Cancel()
        {
            if (Status == OrderStatus.Delivered)
                throw new InvalidOperationException(
                    "Delivered orders cannot be cancelled.");

            if (Status == OrderStatus.Cancelled)
                throw new InvalidOperationException(
                    "Order is already cancelled.");

            Status = OrderStatus.Cancelled;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}