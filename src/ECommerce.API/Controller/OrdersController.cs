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

        // Get all for amin orders
        [Authorize(Roles = Roles.Admin)]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders([FromQuery] GetAllOrdersQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);

            return Ok(result);
        }
        // POST: api/Orders
        // Create an order from the current customer's cart
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand? command,CancellationToken cancellationToken)
        {
            var orderId = await _mediator.Send(command?? new CreateOrderCommand(), cancellationToken);
            return Ok(new
            {
                orderId
            });
        }
        // GET: api/Orders
        // Get current customer's orders
        [HttpGet]
        public async Task<IActionResult> GetAllOrders(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetOrdersQuery(),
                cancellationToken);

            return Ok(result);
        }

        // GET: api/Orders/5
        // Get one order belonging to the current customer
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrder(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(
                new GetOrderByIdQuery(id),
                cancellationToken);

            return Ok(result);
        }

        // PUT: api/orders/5/confirm
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/confirm")]
        public async Task<IActionResult> Confirm(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new ConfirmOrderCommand(id), cancellationToken);

            return NoContent();
        }

        // PUT: api/admin/orders/5/processing
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/processing")]
        public async Task<IActionResult> Processing(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new StartProcessingOrderCommand(id), cancellationToken);
            return NoContent();
        }
        // PUT: api/admin/orders/5/ship
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/ship")]
        public async Task<IActionResult> Ship(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new ShipOrderCommand(id), cancellationToken);
            return NoContent();
        }

        // PUT: api/admin/orders/5/deliver
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/deliver")]
        public async Task<IActionResult> Deliver(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeliverOrderCommand(id), cancellationToken);
            return NoContent();
        }

        // GET: api/admin/orders/5
        [Authorize(Roles = Roles.Admin)]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetOrderforAdmin(int id, CancellationToken cancellationToken)
            => Ok(await _mediator.Send(new GetOrderForAdminQuery(id), cancellationToken));

        // PUT: api/Orders/5/cancel
        // Customer cancels his own order
        [HttpPut("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new CancelOrderCommand(id), cancellationToken);
            return NoContent();
        }

        // PUT: api/admin/orders/5/payment/confirm
        // Body: { "reference": "BANK-TXN-123" } (required for bank transfers, optional for cash)
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}/payment/confirm")]
        public async Task<IActionResult> ConfirmPayment(int id, [FromBody] ConfirmPaymentRequest request, CancellationToken cancellationToken)
        {
            await _mediator.Send(new ConfirmPaymentCommand(id, request.Reference), cancellationToken);
            return NoContent();
        }
    }
}