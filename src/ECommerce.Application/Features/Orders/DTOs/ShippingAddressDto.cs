namespace ECommerce.Application.Features.Orders.DTOs
{
    public sealed record ShippingAddressDto(
        string RecipientName,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string? State,
        string? PostalCode,
        string Country);
}