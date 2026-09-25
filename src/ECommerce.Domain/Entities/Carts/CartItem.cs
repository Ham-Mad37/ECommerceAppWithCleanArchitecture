namespace ECommerce.Domain.Entities.Categories
{
    public class CartItem
    {
        private CartItem()
        {

        }
        private CartItem(int productId,int quantity)
        {
            if (productId <= 0)
                throw new ArgumentException("Product Id must be grater than zero.", nameof(productId));
            ValidateQuantity(quantity);
            ProductId = productId;
            Quantity = quantity;
        }

        public int Id { get; private set; }
        public int CartId { get; private set; }
        public int ProductId { get; private set; }
        public int Quantity { get; private set; }
        //
        
        public static CartItem Create(int productId, int quantity)
        {
            return new CartItem(productId, quantity);
        }
        public void IncreaseQuantity(int quantity)
        {
            ValidateQuantity(quantity);
            Quantity += quantity;
        }
        public void SetQuantity(int quantity)
        {
            ValidateQuantity(quantity);
            Quantity = quantity;
        }
        private void ValidateQuantity(int quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Quantity must be grater than zero.", nameof(quantity));
        }
    }
}