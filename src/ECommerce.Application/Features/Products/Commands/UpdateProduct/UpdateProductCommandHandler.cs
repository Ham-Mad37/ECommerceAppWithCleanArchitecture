using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Features.Products.Command.UpdateProduct;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Products.UpdateProduct;

public sealed class UpdateProductCommandHandler
    : IRequestHandler<UpdateProductCommand>
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductCommandHandler(
        IProductRepository productRepository,
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(
        UpdateProductCommand request,
        CancellationToken cancellationToken)
    {
        // =====================================================
        // 1. Get product
        // =====================================================

        var product =
            await _productRepository.GetByIdAsync(
                request.Id,
                cancellationToken);

        if (product is null)
        {
            throw new NotFoundException(
                $"Product with ID {request.Id} was not found.");
        }

        // =====================================================
        // 2. Validate category
        // =====================================================

        var category =
            await _categoryRepository.GetByIdAsync(
                request.CategoryId,
                cancellationToken);

        if (category is null)
        {
            throw new NotFoundException(
                $"Category with ID {request.CategoryId} was not found.");
        }

        if (!category.IsActive)
        {
            throw new ConflictException(
                $"Category '{category.Name}' is inactive.");
        }

        // =====================================================
        // 3. Update product
        // =====================================================

        product.UpdateDetails(
            request.Name,
            request.Description,
            request.CategoryId);
        //Update product price
        product.ChangePrice(request.Price);
        //Update product Quantity
        product.SetStockQuantity(
            request.StockQuantity);

        // =====================================================
        // 4. Save
        // =====================================================

        await _unitOfWork.SaveChangesAsync(
            cancellationToken);
    }
}