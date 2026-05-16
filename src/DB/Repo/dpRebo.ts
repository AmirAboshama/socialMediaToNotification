import type{ Model,  CreateOptions,  QueryFilter,ProjectionType,  UpdateQuery, Types, QueryOptions, MongooseUpdateQueryOptions ,} from "mongoose";


abstract class dbRebo <T> {
    constructor(protected Model:Model <T>) { }


    public async create({data,options}:{data:any,options?:CreateOptions;}){

        return await this.Model.create(data,options);
    }


    public async findOne({filter,projection,options}:{filter?:QueryFilter<T>,projection?:ProjectionType<T>|null,options?:QueryOptions}){
        return await this.Model.findOne(filter,projection,options);
}
    public async find({filter,projection,options}:{filter?:QueryFilter<T>,projection?:ProjectionType<T>|null,options?:QueryOptions}){
        return await this.Model.find(filter,projection,options);
}
    public async findById({id,projection,options}:{id:string|Types.ObjectId,projection?:ProjectionType<T>|null,options?:QueryOptions}){
        return await this.Model.findById(id,projection,options);
}
    public async updateOne({filter,update,options}:{filter:QueryFilter<T>,update:UpdateQuery<T>,  options?: MongooseUpdateQueryOptions<T>;
}){
        return await this.Model.updateOne(filter,update,options);
}



}

export default dbRebo;
