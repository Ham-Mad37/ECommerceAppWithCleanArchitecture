using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.UpdateAddress
{
    public sealed class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand>
    {
        private readonly IAddressRepository _addressRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateAddressCommandHandler(IAddressRepository addressRepository,
            ICurrentUser currentUser, IUnitOfWork unitOfWork)
        {
            _addressRepository = addressRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();
            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var address = await _addressRepository.GetByIdAsync(request.Id, _currentUser.CustomerId.Value, cancellationToken)
                ?? throw new NotFoundException($"Address with ID {request.Id} was not found.");

            address.Update(request.RecipientName, request.Phone, request.Line1, request.Line2,
                request.City, request.State, request.PostalCode, request.Country);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}