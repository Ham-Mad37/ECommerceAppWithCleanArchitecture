
using ECommerce.Application.Features.Products.Commands.CreateProduct;
using ECommerce.Application.Features.Products.Queries.GetProductById;
using ECommerce.Application.Features.Products.Queries.GetProducts;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controller
{
    [ApiController]
    [Route("Api/[controller]")]
    public sealed class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ProductsController(IMediator mediator)
        {
            _mediator = mediator;
        }
        //Get: api/products
        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] GetProductsQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }
        //Get : api/products/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProductById(int id, CancellationToken cancellationToken)
        {
            var query = new GetProductByIdQuery(id);
            var result = await _mediator.Send(query, cancellationToken);
            if (result == null)
                return NotFound();
            return Ok(result);
        }
        //Post: api/Products
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command,CancellationToken cancellationToken)
        {
            var productId = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetProductById), new { id = productId }, new { id = productId });
        }
    }
}