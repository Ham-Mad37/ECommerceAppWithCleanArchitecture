using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Carts.ClearCart
{
    public sealed class ClearCartCommandHandler : IRequestHandler<ClearCartCommand>
    {
        private readonly ICartRepository _cartRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;
        public ClearCartCommandHandler(ICartRepository cartRepository,
            ICurrentUser currentUser,
            IUnitOfWork unitOfWork)
        {
            _cartRepository = cartRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(ClearCartCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();

            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException(
                   "The authenticated user is not associated with a customer.");
            var cart = await _cartRepository.GetCartByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);

            if (cart is null)
                throw new NotFoundException("Carts not found");

            cart.Clear();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}