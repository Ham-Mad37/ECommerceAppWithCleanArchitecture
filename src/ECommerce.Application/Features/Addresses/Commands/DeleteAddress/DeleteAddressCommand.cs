using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.DeleteAddress
{
    public sealed record DeleteAddressCommand(int Id) : IRequest;
}