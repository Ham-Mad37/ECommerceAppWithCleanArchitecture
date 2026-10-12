using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.UpdateAddress
{
    public sealed record UpdateAddressCommand(
        int Id,
        string RecipientName,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string? State,
        string? PostalCode,
        string Country) : IRequest;
}