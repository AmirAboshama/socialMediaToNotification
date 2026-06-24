import { MapGQLError, unauthorizedError } from "../common/exeption/domain.exeption.js";
import type { roleEnum } from "../common/enums/userEnum.js";

function authorizationGql(
  userRole: roleEnum,
  endpointRole: roleEnum[]
) {
  if (!endpointRole.includes(userRole)) {
    // throw new unauthorizedError("u dont have access");
  MapGQLError(new unauthorizedError("u dont have access"))
  }
}

export default authorizationGql;