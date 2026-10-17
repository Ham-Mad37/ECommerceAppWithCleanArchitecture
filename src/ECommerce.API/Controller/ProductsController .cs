using ECommerce.Application.Common.Constants;
using ECommerce.Application.Common.Features.Products.Command.UpdateProduct;
using ECommerce.Application.Features.Products.Commands.ActivateProduct;
using ECommerce.Application.Features.Products.Commands.AdjustProductStock;
using ECommerce.Application.Features.Products.Commands.CreateProduct;
using ECommerce.Application.Features.Products.Commands.DeactivateProduct;
using ECommerce.Application.Features.Products.Commands.DeleteProductImage;
using ECommerce.Application.Features.Products.Commands.SetPrimaryProductImage;
using ECommerce.Application.Features.Products.Queries.GetProductById;
using ECommerce.Application.Features.Products.Queries.GetProducts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controller
{
    [Authorize]
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
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] GetProductsQuery query, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }
        [AllowAnonymous]
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
        [Authorize(Roles = Roles.Admin)]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command, CancellationToken cancellationToken)
        {
            var productId = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetProductById), new { id = productId }, new { id = productId });
        }

        //PUT: Api/products/5
        [Authorize(Roles = Roles.Admin)]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdatePRoduct(int id, [FromBody] UpdateProductCommand command, CancellationToken cancellationToken)
        {
            if (id != command.Id)
                return BadRequest("Route ID does not match product ID.");
            await _mediator.Send(command, cancellationToken);
            return NoContent();
        }

        // PATCH: api/product/5/activate
        [Authorize(Roles = Roles.Admin)]
        [HttpPatch("{id:int}/activate")]
        public async Task<IActionResult> ActivateProduct(int id, CancellationToken cancellationToken)
        {
            var command = new ActivateProductCommand(id);

            await _mediator.Send(command, cancellationToken);

            return NoContent();

        }

        //PATCH: api/product/5/deactive
        [Authorize(Roles = Roles.Admin)]
        [HttpPatch("{id:int}/deactivate")]
        public async Task<IActionResult> DeactivateProduct(int id, CancellationToken cancellationToken)
        {
            var command = new DeactivateProductComman(id);

            await _mediator.Send(command, cancellationToken);

            return NoContent();
        }

        //Product
        [Authorize(Roles = Roles.Admin)]
        [HttpPatch("{productId:int}/stock")]
        public async Task<IActionResult> AdjustProductStock(int productId,
            [FromBody] AdjustProductStockCommand request,
            CancellationToken cancellationToken)
        {
            var command = new AdjustProductStockCommand(productId, request.Quantity);

            await _mediator.Send(command, cancellationToken);

            return NoContent();
        }

        // POST: api/products/5/images   (multipart/form-data, field name: file)
        [Authorize(Roles = Roles.Admin)]
        [HttpPost("{productId:int}/images")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(6 * 1024 * 1024)]
        public async Task<IActionResult> UploadImage(int productId, IFormFile file, CancellationToken cancellationToken)
        {
            if (file is null)
                return BadRequest("A file is required (form field name: 'file').");

            // Copy into memory (max ~5 MB) so the stream is seekable for the signature check.
            await using var buffer = new MemoryStream();
            await file.CopyToAsync(buffer, cancellationToken);
            buffer.Position = 0;

            var result = await _mediator.Send(
                new AddProductImageCommand(productId, buffer, file.FileName, file.ContentType, file.Length),
                cancellationToken);

            return Ok(result);
        }

        // PATCH: api/products/5/images/12/primary
        [Authorize(Roles = Roles.Admin)]
        [HttpPatch("{productId:int}/images/{imageId:int}/primary")]
        public async Task<IActionResult> SetPrimaryImage(int productId, int imageId, CancellationToken cancellationToken)
        {
            await _mediator.Send(new SetPrimaryProductImageCommand(productId, imageId), cancellationToken);
            return NoContent();
        }
        // DELETE: api/products/5/images/12
        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("{productId:int}/images/{imageId:int}")]
        public async Task<IActionResult> DeleteImage(int productId, int imageId, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteProductImageCommand(productId, imageId), cancellationToken);
            return NoContent();
        }
    }
}