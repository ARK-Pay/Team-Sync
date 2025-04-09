import {SchemaObject} from "../types"

type MetaSchema = (root: boolean) => SchemaObject

const shared: MetaSchema = (root) => {
  const sch: SchemaObject = {
    nullable: {type: "boolean"},
    metadata: {
      optionalProperties: {
        union: {elements: {ref: "schema"}},
      },
      additionalProperties: true,
    },
  }
  if (root) sch.definitions = {values: {ref: "schema"}}
  return sch
}

const emptyForm: MetaSchema = (root) => ({
  optionalProperties: shared(root),
})

const refForm: MetaSchema = (root) => ({
  properties: {
    ref: {type: "string"},
  },
  optionalProperties: shared(root),
})

const typeForm: MetaSchema = (root) => ({
  properties: {
    type: {
      enum: [
        "boolean",
        "timestamp",
        "string",
        "float32",
        "float64",
        "int8",
        "uint8",
        "int16",
        "uint16",
        "int32",
        "uint32",
      ],
    },
  },
  optionalProperties: shared(root),
})

const enumForm: MetaSchema = (root) => ({
  properties: {
    enum: {elements: {type: "string"}},
  },
  optionalProperties: shared(root),
})

const elementsForm: MetaSchema = (root) => ({
  properties: {
    elements: {ref: "schema"},
  },
  optionalProperties: shared(root),
})

const propertiesForm: MetaSchema = (root) => ({
  properties: {
    properties: {values: {ref: "schema"}},
  },
  optionalProperties: {
    optionalProperties: {values: {ref: "schema"}},
    additionalProperties: {type: "boolean"},
    ...shared(root),
  },
})

const optionalPropertiesForm: MetaSchema = (root) => ({
  properties: {
    optionalProperties: {values: {ref: "schema"}},
  },
  optionalProperties: {
    additionalProperties: {type: "boolean"},
    ...shared(root),
  },
})

const discriminatorForm: MetaSchema = (root) => ({
  properties: {
    discriminator: {type: "string"},
    mapping: {
      values: {
        metadata: {
          union: [propertiesForm(false), optionalPropertiesForm(false)],
        },
      },
    },
  },
  optionalProperties: shared(root),
})

const valuesForm: MetaSchema = (root) => ({
  properties: {
    values: {ref: "schema"},
  },
  optionalProperties: shared(root),
})

const schema: MetaSchema = (root) => ({
  metadata: {
    union: [
      emptyForm,
      refForm,
      typeForm,
      enumForm,
      elementsForm,
      propertiesForm,
      optionalPropertiesForm,
      discriminatorForm,
      valuesForm,
    ].map((s) => s(root)),
  },
})

const jtdMetaSchema: SchemaObject = {
  definitions: {
    schema: schema(false),
  },
  ...schema(true),
}

export default jtdMetaSchema
s T[0.5]
      ? false
      : true
    : false
  : false

/** true if the the type is a values type */
type IsValues<T> = false extends IsUnion<T> ? TypeEquality<keyof T, string> : false

/** true if type is a properties type and Union is false, or type is a discriminator type and Union is true */
type IsRecord<T, Union extends boolean> = Union extends IsUnion<T>
  ? null extends EnumString<keyof T>
    ? false
    : true
  : false

/** true if type represents an empty record */
type IsEmptyRecord<T> = [T] extends [Record<string, never>]
  ? [T] extends [never]
    ? false
    : true
  : false

/** actual schema */
export type JTDSchemaType<T, D extends Record<string, unknown> = Record<string, never>> = (
  | // refs - where null wasn't specified, must match exactly
  (null extends EnumString<keyof D>
      ? never
      :
          | ({[K in keyof D]: [T] extends [D[K]] ? {ref: K} : never}[keyof D] & {nullable?: false})
          // nulled refs - if ref is nullable and nullable is specified, then it can
          // match either null or non-null definitions
          | (null extends T
              ? {
                  [K in keyof D]: [Exclude<T, null>] extends [Exclude<D[K], null>]
                    ? {ref: K}
                    : never
                }[keyof D] & {nullable: true}
              : never))
  // empty - empty schemas also treat nullable differently in that it's now fully ignored
  | (unknown extends T ? {nullable?: boolean} : never)
  // all other types // numbers - only accepts the type number
  | ((true extends NullTypeEquality<T, number>
      ? {type: NumberType}
      : // booleans - accepts the type boolean
      true extends NullTypeEquality<T, boolean>
      ? {type: "boolean"}
      : // strings - only accepts the type string
      true extends NullTypeEquality<T, string>
      ? {type: StringType}
      : // strings - only accepts the type Date
      true extends NullTypeEquality<T, Date>
      ? {type: "timestamp"}
      : // enums - only accepts union of string literals
      // TODO we can't actually check that everything in the union was specified
      true extends IsEnum<Exclude<T, null>>
      ? {enum: EnumString<Exclude<T, null>>[]}
      : // arrays - only accepts arrays, could be array of unions to be resolved later
      true extends IsElements<Exclude<T, null>>
      ? T extends readonly (infer E)[]
        ? {
            elements: JTDSchemaType<E, D>
          }
        : never
      : // empty properties
      true extends IsEmptyRecord<Exclude<T, null>>
      ?
          | {properties: Record<string, never>; optionalProperties?: Record<string, never>}
          | {optionalProperties: Record<string, never>}
      : // values
      true extends IsValues<Exclude<T, null>>
      ? T extends Record<string, infer V>
        ? {
            values: JTDSchemaType<V, D>
          }
        : never
      : // properties
      true extends IsRecord<Exclude<T, null>, false>
      ? ([RequiredKeys<Exclude<T, null>>] extends [never]
          ? {
              properties?: Record<string, never>
            }
          : {
              properties: {[K in RequiredKeys<T>]: JTDSchemaType<T[K], D>}
            }) &
          ([OptionalKeys<Exclude<T, null>>] extends [never]
            ? {
                optionalProperties?: Record<string, never>
              }
            : {
                optionalProperties: {
                  [K in OptionalKeys<T>]: JTDSchemaType<Exclude<T[K], undefined>, D>
                }
              }) & {
            additionalProperties?: boolean
          }
      : // discriminator
      true extends IsRecord<Exclude<T, null>, true>
      ? {
          [K in keyof Exclude<T, null>]-?: Exclude<T, null>[K] extends string
            ? {
                discriminator: K
                mapping: {
                  // TODO currently allows descriminator to be present in schema
                  [M in Exclude<T, null>[K]]: JTDSchemaType<
                    Omit<T extends Record<K, M> ? T : never, K>,
                    D
                  >
                }
              }
            : never
        }[keyof Exclude<T, null>]
      : never) &
      (null extends T
        ? {
            nullable: true
          }
        : {nullable?: false}))
) & {
  // extra properties
  metadata?: Record<string, unknown>
  // TODO these should only be allowed at the top level
  definitions?: {[K in keyof D]: JTDSchemaType<D[K], D>}
}

type JTDDataDef<S, D extends Record<string, unknown>> =
  | // ref
  (S extends {ref: string}
      ? D extends {[K in S["ref"]]: infer V}
        ? JTDDataDef<V, D>
        : never
      : // type
      S extends {type: NumberType}
      ? number
      : S extends {type: "boolean"}
      ? boolean
      : S extends {type: "string"}
      ? string
      : S extends {type: "timestamp"}
      ? string | Date
      : // enum
      S extends {enum: readonly (infer E)[]}
      ? string extends E
        ? never
        : [E] extends [string]
        ? E
        : never
      : // elements
      S extends {elements: infer E}
      ? JTDDataDef<E, D>[]
      : // properties
      S extends {
          properties: Record<string, unknown>
          optionalProperties?: Record<string, unknown>
          additionalProperties?: boolean
        }
      ? {-readonly [K in keyof S["properties"]]-?: JTDDataDef<S["properties"][K], D>} & {
          -readonly [K in keyof S["optionalProperties"]]+?: JTDDataDef<
            S["optionalProperties"][K],
            D
          >
        } & ([S["additionalProperties"]] extends [true] ? Record<string, unknown> : unknown)
      : S extends {
          properties?: Record<string, unknown>
          optionalProperties: Record<string, unknown>
          additionalProperties?: boolean
        }
      ? {-readonly [K in keyof S["properties"]]-?: JTDDataDef<S["properties"][K], D>} & {
          -readonly [K in keyof S["optionalProperties"]]+?: JTDDataDef<
            S["optionalProperties"][K],
            D
          >
        } & ([S["additionalProperties"]] extends [true] ? Record<string, unknown> : unknown)
      : // values
      S extends {values: infer V}
      ? Record<string, JTDDataDef<V, D>>
      : // discriminator
      S extends {discriminator: infer M; mapping: Record<string, unknown>}
      ? [M] extends [string]
        ? {
            [K in keyof S["mapping"]]: JTDDataDef<S["mapping"][K], D> & {[KM in M]: K}
          }[keyof S["mapping"]]
        : never
      : // empty
        unknown)
  | (S extends {nullable: true} ? null : never)

export type JTDDataType<S> = S extends {definitions: Record<string, unknown>}
  ? JTDDataDef<S, S["definitions"]>
  : JTDDataDef<S, Record<string, never>>
