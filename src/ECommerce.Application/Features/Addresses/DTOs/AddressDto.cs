namespace ECommerce.Application.Features.Addresses.DTOs
{
    public sealed record AddressDto(
        int Id,
        string RecipientName,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string? State,
        string? PostalCode,
        string Country,
        bool IsDefault);
}
