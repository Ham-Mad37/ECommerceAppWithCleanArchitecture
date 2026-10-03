using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Carts.Commands.UpdateCartItem;

public sealed class UpdateCartItemCommandHandler : IRequestHandler<UpdateCartItemCommand>
{
    private readonly ICartRepository _cartRepository;
    private readonly IProductRepository _productRepository;
    private readonly ICurrentUser _currentUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCartItemCommandHandler(
        ICartRepository cartRepository,
        IProductRepository productRepository,
        ICurrentUser currentUser,
        IUnitOfWork unitOfWork)
    {
        _cartRepository = cartRepository;
        _productRepository = productRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }
    public async Task Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException();
        if (_currentUser.CustomerId is null)
            throw new UnauthorizedAccessException(
                   "The authenticated user is not associated with a customer.");

        var cart = await _cartRepository.GetCartByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);

        if (cart is null)
            throw new NotFoundException("cart");

        var product = await _productRepository.GetByIdAsync(request.ProductId);
        if (product is null)
            throw new NotFoundException($"Product with ID {request.ProductId} was not found.");
        if (!product.IsActive)
            throw new ConflictException(
                "This product is not available.");
        if (request.Quantity > product.StockQuantity)
            throw new ConflictException(
                $"Only {product.StockQuantity} units of this product are available.");
        try
        {
            cart.UpdateQuantity(request.ProductId, request.Quantity);

        }
        catch (KeyNotFoundException)
        {
            throw new NotFoundException($"Cart Item ,{request.ProductId} was not found. ");
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);

    }
}