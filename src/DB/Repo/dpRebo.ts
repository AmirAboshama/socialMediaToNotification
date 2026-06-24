import type { Types } from "mongoose";
import type {
  QueryFilter,
  UpdateQuery,
  QueryOptions,
  ProjectionType,
  Model,
} from "mongoose";
abstract class dbRebo<T> {
  constructor(protected Model: Model<T>) {}

  public async create({
    data,
    options
  }: {
    data: any;
    options?: QueryOptions;
  }) {
    return await this.Model.create(data);
  }

  public async findOne({
    filter,
    projection,
    options
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null;
    options?: QueryOptions;
  }) {
    return await this.Model.findOne(filter, projection, options);
  }

public async findOneAndUpdate({
  filter,
  update,
  options
}: {
  filter: QueryFilter<T>;
  update: UpdateQuery<T>;
  options?: QueryOptions;
}) {
  return this.Model.findOneAndUpdate(filter, update, options);
}

  public async find({
    filter,
    projection,
    options
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null;
    options?: QueryOptions;
  }) {
    return await this.Model.find(filter, projection, options);
  }

  public async findById({
    id,
    projection,
    options
  }: {
    id: string | Types.ObjectId;
    projection?: ProjectionType<T> | null;
    options?: QueryOptions;
  }) {
    return await this.Model.findById(id, projection, options);
  }

  public async updateOne({
    filter,
    update,
    options
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: any;
  }) {
    return await this.Model.updateOne(filter, update, options);
  }

  async paginate({
    filter,
    projection,
    options,
    page = 1,
    size = 3
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null;
    options?: QueryOptions<T>;
    page?: number;
    size?: number;
  }) {
    const skip = (page - 1) * size;

    const docs = await this.Model.find(filter, projection, options)
      .skip(skip)
      .limit(size);

    const totalDocs = await this.Model.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / size);

    return { docs, page, totalDocs, totalPages :Math.ceil(totalDocs / size) };
  }

  getDBDoc(data: T) {
    return new this.Model(data);
  }
}

export default dbRebo;
