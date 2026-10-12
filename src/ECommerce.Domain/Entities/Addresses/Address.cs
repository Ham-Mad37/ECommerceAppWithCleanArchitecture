using System.Runtime.InteropServices;
using ECommerce.Domain.Common.Exceptions;

namespace ECommerce.Domain.Entities.Addresses
{
    public class Address
    {
        private Address() { }
        public int Id { get; private set; }
        public int CustomerId { get; private set; }
        public string RecipientName { get; private set; } = null!;
        public string Phone { get; private set; } = null!;
        public string Line1 { get;private set; } = null!;
        public string? Line2 { get; private set; }
        public string City { get; private set; } = null!;
        public string? State { get; private set; }
        public string? PostalCode { get; private set; }
        public string Country { get; private set; } = null!;
        public bool IsDefault { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        public static Address Create(
            int customerId,string recipientName, string phone, string line1, string? line2,
            string city, string? state, string? postalCode, string country, bool isDefault)
        {
            if (customerId <= 0)
                throw new DomainException("Customer Id must be greater than zero.");

            var address = new Address
            {
                CustomerId = customerId,
                IsDefault = isDefault,
                CreatedAt = DateTime.UtcNow
            };

            address.Apply(recipientName, phone, line1, line2, city, state, postalCode, country);
            return address;
        }

        public void Update(string recipientName, string phone, string line1, string? line2,
            string city, string? state, string? postalCode, string country)
        {
            Apply(recipientName, phone, line1, line2, city, state, postalCode, country);
        }

        public void MakeDefault()
        {
            IsDefault = true;
            UpdatedAt = DateTime.UtcNow;
        }

        public void RemoveDefault()
        {
            IsDefault = false;
            UpdatedAt = DateTime.UtcNow;
        }

        private void Apply(
            string recipientName, string phone, string line1, string? line2,
            string city, string? state, string? postalCode, string country)
        {
            RecipientName = Required(recipientName, "Recipient name", 150);
            Phone = Required(phone, "Phone", 30);
            Line1 = Required(line1, "Address line 1", 200);
            Line2 = Optional(line2, "Address line 2", 200);
            City = Required(city, "City", 100);
            State = Optional(state, "State", 100);
            PostalCode = Optional(postalCode, "Postal code", 20);
            Country = Required(country, "Country", 100);
            UpdatedAt = DateTime.UtcNow;
        }

        private static string Required(string? value, string field, int max)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainException($"{field} is required.");
            var trimmed = value.Trim();
            if (trimmed.Length > max)
                throw new DomainException($"{field} cannot exceed {max} characters.");
            return trimmed;
        }

        private static string? Optional(string? value, string field, int max)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;
            var trimmed = value.Trim();
            if (trimmed.Length > max)
                throw new DomainException($"{field} cannot exceed {max} characters.");
            return trimmed;
        }
    }
}