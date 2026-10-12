using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.AddAddress
{
    public sealed record AddAddressCommand(
        string RecipientName,
        string Phone,
        string Line1,
        string? Line2,
        string City,
        string? State,
        string? PostalCode,
        string Country,
        bool MakeDefault = false) : IRequest<int>;
}