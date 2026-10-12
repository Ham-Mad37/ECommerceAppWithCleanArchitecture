using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Addresses.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Queries.GetMyAddresses
{
    public sealed class GetMyAddressesQueryHandler
        : IRequestHandler<GetMyAddressesQuery, IReadOnlyCollection<AddressDto>>
    {
        private readonly IAddressRepository _addressRepository;
        private readonly ICurrentUser _currentUser;

        public GetMyAddressesQueryHandler(IAddressRepository addressRepository, ICurrentUser currentUser)
        {
            _addressRepository = addressRepository;
            _currentUser = currentUser;
        }

        public async Task<IReadOnlyCollection<AddressDto>> Handle(
            GetMyAddressesQuery request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();
            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var addresses = await _addressRepository.GetByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);

            return addresses
                .Select(a => new AddressDto(a.Id, a.RecipientName, a.Phone, a.Line1, a.Line2,
                    a.City, a.State, a.PostalCode, a.Country, a.IsDefault))
                .ToList();
        }
    }
}