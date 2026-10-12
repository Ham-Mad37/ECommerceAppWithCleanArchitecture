using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.SetDefaultAddress
{
    public sealed class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand>
    {
        private readonly IAddressRepository _addressRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;

        public SetDefaultAddressCommandHandler(IAddressRepository addressRepository,
            ICurrentUser currentUser, IUnitOfWork unitOfWork)
        {
            _addressRepository = addressRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(SetDefaultAddressCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();
            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var addresses = await _addressRepository.GetByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);
            var target = addresses.FirstOrDefault(x => x.Id == request.Id)
                ?? throw new NotFoundException($"Address with ID {request.Id} was not found.");

            foreach (var a in addresses.Where(x => x.IsDefault && x.Id != target.Id))
                a.RemoveDefault();

            target.MakeDefault();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}