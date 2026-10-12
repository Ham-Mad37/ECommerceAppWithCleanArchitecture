using ECommerce.Domain.Entities.Addresses;

namespace ECommerce.Domain.Entities.Orders
{
    // Snapshot of an address at the time the order was placed.
    public class ShippingAddress
    {
        private ShippingAddress() { }

        public string RecipientName { get; private set; } = null!;
        public string Phone { get; private set; } = null!;
        public string Line1 { get; private set; } = null!;
        public string? Line2 { get; private set; }
        public string City { get; private set; } = null!;
        public string? State { get; private set; }
        public string? PostalCode { get; private set; }
        public string Country { get; private set; } = null!;

        public static ShippingAddress From(Address address) => new()
        {
            RecipientName = address.RecipientName,
            Phone = address.Phone,
            Line1 = address.Line1,
            Line2 = address.Line2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country
        };
    }
}