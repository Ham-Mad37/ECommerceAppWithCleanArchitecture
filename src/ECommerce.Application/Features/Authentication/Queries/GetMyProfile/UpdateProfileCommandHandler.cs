using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.Commands.UpdateProfile;
using MediatR;

namespace ECommerce.Application.Features.Authentication.Queries.GetMyProfile
{
    public sealed class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand>
    {

        private readonly ICustomerRepository _customerRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateProfileCommandHandler(
            ICustomerRepository customerRepository, ICurrentUser currentUser, IUnitOfWork unitOfWork)
        {
            _customerRepository = customerRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }

        public async Task  Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();
            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var customer = await _customerRepository.GetByIdAsync(_currentUser.CustomerId.Value, cancellationToken)
               ?? throw new NotFoundException("Customer was not found.");

            customer.Update(request.FirstName, request.LastName);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}