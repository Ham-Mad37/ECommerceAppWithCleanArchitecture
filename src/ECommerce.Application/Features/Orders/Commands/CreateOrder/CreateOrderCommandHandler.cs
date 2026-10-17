using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Addresses;
using ECommerce.Domain.Entities.Orders;
using ECommerce.Domain.Entities.Payments;
using MediatR;

namespace ECommerce.Application.Features.Orders.CreateOrder
{
    public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, int>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IAddressRepository _addressRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;
        public CreateOrderCommandHandler(IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IAddressRepository addressRepository,
            ICurrentUser currentUser,
            IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _addressRepository = addressRepository;
            _cartRepository = cartRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }
        public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();

            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException("The authenticated user is not associated with a customer.");

            var customerId = _currentUser.CustomerId.Value;
            // =====================================================
            // 1. Get shipping address
            // =====================================================

            Address? address;
            if (request.AddressId.HasValue)
            {
                address = await _addressRepository.GetByIdAsync(request.AddressId.Value, customerId, cancellationToken)
                ?? throw new NotFoundException($"Address with ID {request.AddressId.Value} was not found.");
            }
            else
            {
                var addresses = await _addressRepository.GetByCustomerIdAsync(customerId, cancellationToken);
                address = addresses.FirstOrDefault(x => x.IsDefault)
                ?? throw new ConflictException("Please add a shipping address before placing an order.");
            }
            // =====================================================
            // 2. Create order inside transaction
            // =====================================================
            int orderId = 0;
            await _unitOfWork.ExecuteInTransactionAsync(
               async () =>
               {
                   // =================================================
                   // Get customer cart
                   // =================================================

                   var cart = await _cartRepository.GetCartByCustomerIdAsync(customerId, cancellationToken);

                   if (cart is null || !cart.Items.Any())
                   {
                       throw new ConflictException(
                      "Cannot create an order from an empty cart.");
                   }
                   // =================================================
                   // Create order
                   // =================================================

                   var order = Order.Create(customerId);
                   order.SetShippingAddress(address);

                   // =================================================
                   // Add order items
                   // =================================================

                   foreach (var cartItem in cart.Items)
                   {
                       var product = cartItem.Product;
                       if (!product.IsActive)
                       {
                           throw new ConflictException(
                               $"Product '{product.Name}' is no longer available.");
                       }

                       if (cartItem.Quantity > product.StockQuantity)
                       {
                           throw new ConflictException(
                           $"Only {product.StockQuantity} units of " +
                           $"'{product.Name}' are available.");
                       }

                       order.AddItem(
                           product.Id,
                           product.Name,
                           product.Price,
                           cartItem.Quantity
                       );
                       product.DecreaseStock(cartItem.Quantity);
                   }

                   // =================================================
                   // Pricing
                   // =================================================
                   order.SetShippingCost(0);
                   order.SetDiscount(0);

                   // =================================================
                   // Payment
                   // =================================================

                   order.SetPayment(request.PaymentMethod ?? PaymentMethod.CashOnDelivery);
                   // =================================================
                   // Save order
                   // =================================================

                   await _orderRepository.AddAsync(order, cancellationToken);
                   // =================================================
                   // Clear cart
                   // =================================================

                   cart.Clear();
                   
                   // =================================================
                   // Save everything
                   // =================================================
                   await _unitOfWork.SaveChangesAsync(cancellationToken);

                   orderId = order.Id;

               },
               cancellationToken
            );
            return orderId;
        }
    }
}