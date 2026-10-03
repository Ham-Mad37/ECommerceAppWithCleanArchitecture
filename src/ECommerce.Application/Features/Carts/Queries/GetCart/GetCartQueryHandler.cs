using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Carts.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Carts.Queries.GetCart;
public sealed class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto>
{
    private readonly ICartRepository _cartRepository;
    private readonly ICurrentUser _currentUser;
    public GetCartQueryHandler(ICartRepository cartRepository, ICurrentUser currentUser)
    {
        _cartRepository = cartRepository;
        _currentUser = currentUser;
    }
    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("User is not authenticated.");
       if(_currentUser.CustomerId == null)
            throw new InvalidOperationException("Customer ID is not available for the current user.");

        var cart = await _cartRepository.GetCartByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);

        if (cart is null)
        {
            return new CartDto(
                0,
                [],
                0);
        }
        var items = cart.Items
            .Select(item => new CartItemDto(
                item.ProductId,
                item.Product.Name,
                item.Product.Price,
                item.Quantity,
                item.Product.Price * item.Quantity))
            .ToList();

        var subtotal = items.Sum(i => i.LineTotal);
        
        return new CartDto(
            cart.Id,
            items,
            subtotal);
    }
}