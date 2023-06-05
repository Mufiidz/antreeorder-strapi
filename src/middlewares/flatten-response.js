// const strapiFlatten = (data) => {
//   const isObject = (data) =>
//     Object.prototype.toString.call(data) === "[object Object]";
//   const isArray = (data) =>
//     Object.prototype.toString.call(data) === "[object Array]";

//   const flatten = (data) => {
//     if (!data.attributes) return data;

//     return {
//       id: data.id,
//       ...data.attributes,
//     };
//   };

//   if (isArray(data)) {
//     return data.map((item) => strapiFlatten(item));
//   }

//   if (isObject(data)) {
//     if (isArray(data.data)) {
//       data = [...data.data];
//     } else if (isObject(data.data)) {
//       data = flatten({ ...data.data });
//     } else if (data.data === null) {
//       data = null;
//     } else {
//       data = flatten(data);
//     }

//     for (const key in data) {
//       data[key] = strapiFlatten(data[key]);
//     }

//     return data;
//   }

//   return data;
// };

function flattenArray(obj) {
  return obj.map((e) => flatten(e));
}

function flattenData(obj) {
  return flatten(obj.data);
}

function flattenAttrs(obj) {
  let attrs = {};
  for (let key in obj.attributes) {
    attrs[key] = flatten(obj.attributes[key]);
  }
  return {
    id: obj.id,
    ...attrs,
  };
}

function flatten(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj.data) {
    return flattenData(obj);
  }

  if (Array.isArray(obj)) {
    return flattenArray(obj);
  }

  if (obj.attributes) {
    return flattenAttrs(obj);
  }

  if (typeof obj !== "string") {
    for (let key in obj) {
      obj[key] = flatten(obj[key]);
    }
  }

  return obj;
}

async function respond(ctx, next) {
  await next();
  if (!ctx.url.startsWith("/api")) {
    return;
  }
  console.log(
    `API request (${ctx.url}) detected, transforming response json...`
  );

  if (ctx.response.status < 400) {
    const body = {
      data: ctx.response.body.data && flatten(ctx.response.body.data),
      meta: ctx.response.body.meta,
    };

    if (typeof flatten(ctx.response.body.data) !== "undefined") {
      ctx.response.body = body;
    }
  }
}

module.exports = () => respond;
