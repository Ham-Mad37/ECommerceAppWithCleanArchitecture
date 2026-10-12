using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Addresses;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.AddAddress
{
    public sealed class AddAddressCommandHandler : IRequestHandler<AddAddressCommand, int>
    {
        private const int MaxAddressesPerCustomer = 20;

        private readonly IAddressRepository _addressRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;
        public AddAddressCommandHandler (IAddressRepository addressRepository,ICurrentUser currentUser,IUnitOfWork unitOfWork)
        {
            _addressRepository = addressRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }

        public async Task<int> Handle(AddAddressCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();
            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var customerId = _currentUser.CustomerId.Value;
            var existing = await _addressRepository.GetByCustomerIdAsync(customerId, cancellationToken);

            if (existing.Count >= MaxAddressesPerCustomer)
                throw new ConflictException($"You can save up to {MaxAddressesPerCustomer} addresses.");


            // The first address is always the default.
            var isDefault = existing.Count == 0 || request.MakeDefault;
            if (isDefault)
            {
                foreach (var a in existing.Where(x => x.IsDefault))
                    a.RemoveDefault();
            }

            //Createing Address Object
            var address = Address.Create(customerId, request.RecipientName, request.Phone,
               request.Line1, request.Line2, request.City, request.State,
               request.PostalCode, request.Country, isDefault);
               
            //save it into database
            await _addressRepository.AddAsync(address, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return address.Id;

        }
    }
}