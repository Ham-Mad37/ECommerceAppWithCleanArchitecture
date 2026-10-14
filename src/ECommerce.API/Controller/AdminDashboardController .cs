using ECommerce.Application.Common.Constants;
using ECommerce.Application.Features.Dashboard.Queries.GetDashboardSummary;
using ECommerce.Application.Features.Dashboard.Queries.GetLowStockProducts;
using ECommerce.Application.Features.Dashboard.Queries.GetSalesByDay;
using ECommerce.Application.Features.Dashboard.Queries.GetTopProducts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controller
{
    [Authorize(Roles = Roles.Admin)]
    [ApiController]
    [Route("api/admin/dashboard")]
    public sealed class AdminDashboardController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AdminDashboardController(IMediator mediator) => _mediator = mediator;

        // GET: api/admin/dashboard/summary?from=2026-10-01&to=2026-10-31
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] GetDashboardSummaryQuery query, CancellationToken cancellationToken)
            => Ok(await _mediator.Send(query, cancellationToken));

        // GET: api/admin/dashboard/top-products?take=10
        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] GetTopProductsQuery query, CancellationToken cancellationToken)
            => Ok(await _mediator.Send(query, cancellationToken));

        // GET: api/admin/dashboard/sales-by-day
        [HttpGet("sales-by-day")]
        public async Task<IActionResult> GetSalesByDay([FromQuery] GetSalesByDayQuery query, CancellationToken cancellationToken)
            => Ok(await _mediator.Send(query, cancellationToken));

        // GET: api/admin/dashboard/low-stock?threshold=5
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock([FromQuery] GetLowStockProductsQuery query, CancellationToken cancellationToken)
            => Ok(await _mediator.Send(query, cancellationToken));
    }
}