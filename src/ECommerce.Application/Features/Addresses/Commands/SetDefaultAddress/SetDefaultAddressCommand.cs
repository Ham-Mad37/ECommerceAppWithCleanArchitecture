using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.SetDefaultAddress
{
    public sealed record SetDefaultAddressCommand(int Id) : IRequest;
}