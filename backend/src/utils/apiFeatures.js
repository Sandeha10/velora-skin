export class APIFeatures {
  constructor(mongooseQuery, queryString) {
    this.query = mongooseQuery;
    this.queryString = queryString;
  }

  // 1. Faceted Filtering: category, skinType, price[gte], price[lte]
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle array filtering for skinType (?skinType=dry,sensitive)
    if (queryObj.skinType && typeof queryObj.skinType === 'string') {
      queryObj.skinType = { $in: queryObj.skinType.split(',') };
    }

    // Advanced filtering: replace gte, gt, lte, lt with MongoDB operators ($gte, etc.)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // 2. Text Search Handling
  search() {
    if (this.queryString.search) {
      this.query = this.query.find({
        $text: { $search: this.queryString.search },
      });
    }
    return this;
  }

  // 3. Dynamic Multi-Field Sorting (?sort=price,-ratingsAverage)
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default to newest
    }
    return this;
  }

  // 4. Projection / Field Limiting (?fields=title,price,images)
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // 5. Pagination
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(this.queryString.limit, 10) || 12));
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}