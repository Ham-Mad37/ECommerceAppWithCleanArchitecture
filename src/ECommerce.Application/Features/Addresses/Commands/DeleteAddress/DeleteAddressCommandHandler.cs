using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Addresses.Commands.DeleteAddress
{
    public sealed class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand>
    {
        private readonly IAddressRepository _addressRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteAddressCommandHandler(IAddressRepository addressRepository,
            ICurrentUser currentUser, IUnitOfWork unitOfWork)
        {
            _addressRepository = addressRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(DeleteAddressCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();
            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var addresses = await _addressRepository.GetByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);
            var target = addresses.FirstOrDefault(x => x.Id == request.Id)
                ?? throw new NotFoundException($"Address with ID {request.Id} was not found.");

            _addressRepository.Remove(target);

            // If the default address was deleted, promote the oldest remaining one.
            if (target.IsDefault)
            {
                addresses.Where(x => x.Id != target.Id)
                         .OrderBy(x => x.Id)
                         .FirstOrDefault()?.MakeDefault();
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}