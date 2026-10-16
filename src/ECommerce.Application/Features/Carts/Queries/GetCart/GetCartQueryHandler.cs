using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Carts.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Carts.Queries.GetCart;
public sealed class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto>
{
    private readonly ICartRepository _cartRepository;
    private readonly ICurrentUser _currentUser;
    private readonly IProductImageStorage _storage;
    public GetCartQueryHandler(ICartRepository cartRepository, ICurrentUser currentUser, IProductImageStorage storage)
    {
        _cartRepository = cartRepository;
        _currentUser = currentUser;
        _storage = storage;
    }
    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException("User is not authenticated.");

       if(_currentUser.CustomerId == null)
            throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

        var cart = await _cartRepository.GetCartByCustomerIdAsync(_currentUser.CustomerId.Value, cancellationToken);

        if (cart is null)
        {
            return new CartDto(
                0,
                [],
                0);
        }
        var items = cart.Items
        .Select(item =>
            {
                var primary = item.Product.Images.FirstOrDefault(i => i.IsPrimary);
                return new CartItemDto(
                    item.ProductId,
                    item.Product.Name,
                    item.Product.Price,
                    item.Quantity,
                    item.Product.Price * item.Quantity,
                    primary is null ? null : _storage.GetUrl(primary.FileName),
                    item.Product.StockQuantity);
            })
            .ToList();

        var subtotal = items.Sum(i => i.LineTotal);
        
        return new CartDto(
            cart.Id,
            items,
            subtotal);
    }
}