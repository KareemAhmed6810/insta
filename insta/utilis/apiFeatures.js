class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const execludedField = ['page', 'sort', 'limit', 'fields'];
    execludedField.forEach(el => delete queryObj[el]);

    // 1B)Advanced filtering
    //shakl el req.query
    // { duration: '3'}
    // 127.0.0.1:3000/api/v1/tours?duration[gte]=3&difficulty=easy
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryStr = JSON.parse(queryStr);
    this.query = this.query.find(queryStr);
    // ana 3aml chaining fo2 filter we b3dha sort f el sort hyst2bl eh
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      console.log('********************');
      console.log(this.queryString.sort);
      let sortBy = this.queryString.sort.split(',');
      console.log(sortBy);
      sortBy = sortBy.join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('ratingsAverage price');
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // console.log(this.queryString.fields);
      let fields = this.queryString.fields.split(',').join(' ');
      console.log(fields);

      this.query = this.query.select(fields);
    } else {
      //minus law abl el haga m3naha hide
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = Number(this.queryString.limit) || 2;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = { ApiFeatures };
