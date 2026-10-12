using ECommerce.Application.Features.Addresses.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Queries.GetMyAddresses
{
    public sealed record GetMyAddressesQuery : IRequest<IReadOnlyCollection<AddressDto>>;
}