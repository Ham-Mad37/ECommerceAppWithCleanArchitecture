using ECommerce.API.Contracts.Orders;
using ECommerce.Application.Common.Constants;
using ECommerce.Application.Features.Orders.Admin.GetOrderForAdmin;
using ECommerce.Application.Features.Orders.Commands.CancelOrder;
using ECommerce.Application.Features.Orders.Commands.ConfirmOrder;
using ECommerce.Application.Features.Orders.Commands.ConfirmPayment;
using ECommerce.Application.Features.Orders.Commands.DeliverOrder;
using ECommerce.Application.Features.Orders.Commands.ShipOrder;
using ECommerce.Application.Features.Orders.Commands.StartProcessingOrder;
using ECommerce.Application.Features.Orders.CreateOrder;
using ECommerce.Application.Features.Orders.GetOrderById;
using ECommerce.Application.Features.Orders.Queries.GetOrder;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controller
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public sealed class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;
        public OrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // =========================================================
        // CUSTOMER
        // =========================================================

        /// <summary>
        /// Get all orders belonging to the authenticated customer.
        /// </summary>
        // GET: api/Orders
        // Get current customer's orders
        [HttpGet]
        [Authorize(Roles = Roles.Customer)]
         public async Task<IActionResult> GetMyOrders(CancellationToken cancellationToken)
         {
             var result = await _mediator.Send(
                 new GetOrdersQuery(),
                 cancellationToken);

             return Ok(result);
         }
        // =========================================================
        // CUSTOMER - GET ONE
        // =========================================================

        /// <summary>
        /// Get one order belonging to the authenticated customer.
        /// </summary>
         // GET: api/Orders/5
        // Get one order belonging to the current customer
        [HttpGet("{id:int}")]
        [Authorize(Roles = Roles.Customer)]
        public async Task<IActionResult> GetMyOrder(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetOrderByIdQuery(id),
                cancellationToken);

            return Ok(result);
        }
        // =========================================================
        // CUSTOMER - CREATE ORDER
        // =========================================================
        // POST: api/Orders
        // Create an order from the current customer's cart
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand? command, CancellationToken cancellationToken)
        {
            var orderId = await _mediator.Send(command ?? new CreateOrderCommand(), cancellationToken);
            return Ok(new
            {
                orderId
            });
        }
        // =========================================================
        // CUSTOMER - CANCEL ORDER
        // =========================================================
        // PUT: api/Orders/5/cancel
        // Customer cancels his own order
        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new CancelOrderCommand(id), cancellationToken);
            return NoContent();
        }

        // =========================================================
        // ADMIN - GET ALL ORDERS
        // =========================================================

        /// <summary>
        /// Get all orders with admin filters and pagination.
        /// </summary>
        // Get all for amin orders
        [Authorize(Roles = Roles.Admin)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAllOrdersForAdmin([FromQuery] GetAllForAdminQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);

            return Ok(result);
        }

        // =========================================================
        // ADMIN - GET ONE ORDER
        // =========================================================
        /// <summary>
        /// Get any order by ID as an administrator.
        /// </summary>
        [HttpGet("admin/{id:int}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetOrderForAdmin(
            int id,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetOrderForAdminQuery(id),
                cancellationToken);
            return Ok(result);
        }

        // =========================================================
        // ADMIN - CONFIRM ONE ORDER
        // =========================================================
        /// <summary>
        /// Confirm  order as an administrator.
        /// </summary>
        /// 
        // PUT: api/orders/5/confirm
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/confirm/Admin")]
        public async Task<IActionResult> Confirm(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new ConfirmOrderCommand(id), cancellationToken);

            return NoContent();
        }
        // =========================================================
        // ADMIN - PROCESS ONE ORDER
        // =========================================================
        /// <summary>
        /// Processing  order as an administrator.
        /// </summary>
        /// 
        // PUT: api/admin/orders/5/processing
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/processing/Admin")]
        public async Task<IActionResult> Processing(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new StartProcessingOrderCommand(id), cancellationToken);
            return NoContent();
        }

        // =========================================================
        // ADMIN - SHIPING ONE ORDER
        // =========================================================
        /// <summary>
        /// Shipping order as an administrator.
        /// </summary>
        /// 
        // PUT: api/admin/orders/5/ship
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/ship/Admin")]
        public async Task<IActionResult> Ship(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new ShipOrderCommand(id), cancellationToken);
            return NoContent();
        }
        // =========================================================
        // ADMIN - DELEVER ONE ORDER
        // =========================================================
        /// <summary>
        /// Deliver order as an administrator.
        /// </summary>
        /// 
        // PUT: api/admin/orders/5/deliver
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/deliver/Admin")]
        public async Task<IActionResult> Deliver(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeliverOrderCommand(id), cancellationToken);
            return NoContent();
        }

        // =========================================================
        // ADMIN - CONFIRM PAYMENT
        // =========================================================
        /// <summary>
        /// Confirm payment as an administrator.
        /// </summary>
        /// 
        // PUT: api/admin/orders/5/payment/confirm
        // Body: { "reference": "BANK-TXN-123" } (required for bank transfers, optional for cash)
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/payment/confirm/Admin")]
        public async Task<IActionResult> ConfirmPayment(int id, [FromBody] ConfirmPaymentRequest request, CancellationToken cancellationToken)
        {
            await _mediator.Send(new ConfirmPaymentCommand(id, request.Reference), cancellationToken);
            return NoContent();
        }
    }
}