using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Cart;
using MediatR;

namespace ECommerce.Application.Features.Carts.Commands.AddCartItem
{
    public sealed class AddCartItemCommandHandler : IRequestHandler<AddCartItemCommand>
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;
        //Constructor
        public AddCartItemCommandHandler(ICartRepository cartRepository,
            IProductRepository productRepository,
            ICurrentUser currentUser,
            IUnitOfWork unitOfWork)
        {
            _cartRepository = cartRepository;
            _productRepository = productRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(AddCartItemCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();
            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var product = await _productRepository.GetByIdAsync(request.productId, cancellationToken);
            if (product is null)
                throw new NotFoundException($"Product with ID {request.productId} was not found.");

            if (!product.IsActive)
                throw new ConflictException(
                    "This product is not available.");

            if (request.Quantity > product.StockQuantity)
                throw new ConflictException(
                    "The requested quantity exceeds available stock.");

            var cart = await _cartRepository.GetCartByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);

            if (cart is null)
            {
                cart = Cart.Create(_currentUser.CustomerId.Value);
                await _cartRepository.AddAsync(cart, cancellationToken);

            }
            var existingItem = cart.Items.FirstOrDefault(x => x.ProductId == product.Id);
            var newQuantity = existingItem is null ? request.Quantity : existingItem.Quantity + request.Quantity;

            if (newQuantity > product.StockQuantity)
            {
                throw new ConflictException( $"Only {product.StockQuantity} units of this product are available.");
            }

            cart.AddItem(product.Id, request.Quantity);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}