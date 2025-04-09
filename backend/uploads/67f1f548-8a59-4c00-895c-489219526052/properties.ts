import type {CodeKeywordDefinition} from "../../types"
import {KeywordCxt} from "../../compile/validate"
import {propertyInData, allSchemaProperties} from "../code"
import {alwaysValidSchema, toHash, mergeEvaluated} from "../../compile/util"
import apDef from "./additionalProperties"

const def: CodeKeywordDefinition = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(cxt: KeywordCxt) {
    const {gen, schema, parentSchema, data, it} = cxt
    if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === undefined) {
      apDef.code(new KeywordCxt(it, apDef, "additionalProperties"))
    }
    const allProps = allSchemaProperties(schema)
    for (const prop of allProps) {
      it.definedProperties.add(prop)
    }
    if (it.opts.unevaluated && allProps.length && it.props !== true) {
      it.props = mergeEvaluated.props(gen, toHash(allProps), it.props)
    }
    const properties = allProps.filter((p) => !alwaysValidSchema(it, schema[p]))
    if (properties.length === 0) return
    const valid = gen.name("valid")

    for (const prop of properties) {
      if (hasDefault(prop)) {
        applyPropertySchema(prop)
      } else {
        gen.if(propertyInData(gen, data, prop, it.opts.ownProperties))
        applyPropertySchema(prop)
        if (!it.allErrors) gen.else().var(valid, true)
        gen.endIf()
      }
      cxt.it.definedProperties.add(prop)
      cxt.ok(valid)
    }

    function hasDefault(prop: string): boolean | undefined {
      return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== undefined
    }

    function applyPropertySchema(prop: string): void {
      cxt.subschema(
        {
          keyword: "properties",
          schemaProp: prop,
          dataProp: prop,
        },
        valid
      )
    }
  },
}

export default def
 message: "should NOT have additional properties",
//   params: ({params}) => _`{additionalProperty: ${params.additionalProperty}}`,
// }

export function validateProperties(cxt: KeywordCxt): void {
  checkMetadata(cxt)
  const {gen, data, parentSchema, it} = cxt
  const {additionalProperties, nullable} = parentSchema
  if (it.jtdDiscriminator && nullable) throw new Error("JTD: nullable inside discriminator mapping")
  if (commonProperties()) {
    throw new Error("JTD: properties and optionalProperties have common members")
  }
  const [allProps, properties] = schemaProperties("properties")
  const [allOptProps, optProperties] = schemaProperties("optionalProperties")
  if (properties.length === 0 && optProperties.length === 0 && additionalProperties) {
    return
  }

  const [valid, cond] =
    it.jtdDiscriminator === undefined
      ? checkNullableObject(cxt, data)
      : [gen.let("valid", false), true]
  gen.if(cond, () =>
    gen.assign(valid, true).block(() => {
      validateProps(properties, "properties", true)
      validateProps(optProperties, "optionalProperties")
      if (!additionalProperties) validateAdditional()
    })
  )
  cxt.pass(valid)

  function commonProperties(): boolean {
    const props = parentSchema.properties as Record<string, any> | undefined
    const optProps = parentSchema.optionalProperties as Record<string, any> | undefined
    if (!(props && optProps)) return false
    for (const p in props) {
      if (Object.prototype.hasOwnProperty.call(optProps, p)) return true
    }
    return false
  }

  function schemaProperties(keyword: string): [string[], string[]] {
    const schema = parentSchema[keyword]
    const allPs = schema ? allSchemaProperties(schema) : []
    if (it.jtdDiscriminator && allPs.some((p) => p === it.jtdDiscriminator)) {
      throw new Error(`JTD: discriminator tag used in ${keyword}`)
    }
    const ps = allPs.filter((p) => !alwaysValidSchema(it, schema[p]))
    return [allPs, ps]
  }

  function validateProps(props: string[], keyword: string, required?: boolean): void {
    const _valid = gen.var("valid")
    for (const prop of props) {
      gen.if(
        propertyInData(gen, data, prop, it.opts.ownProperties),
        () => applyPropertySchema(prop, keyword, _valid),
        () => missingProperty(prop)
      )
      cxt.ok(_valid)
    }

    function missingProperty(prop: string): void {
      if (required) {
        gen.assign(_valid, false)
        cxt.error(false, {propError: PropError.Missing, missingProperty: prop}, {schemaPath: prop})
      } else {
        gen.assign(_valid, true)
      }
    }
  }

  function applyPropertySchema(prop: string, keyword: string, _valid: Name): void {
    cxt.subschema(
      {
        keyword,
        schemaProp: prop,
        dataProp: prop,
      },
      _valid
    )
  }

  function validateAdditional(): void {
    gen.forIn("key", data, (key: Name) => {
      const addProp = isAdditional(key, allProps, "properties", it.jtdDiscriminator)
      const addOptProp = isAdditional(key, allOptProps, "optionalProperties")
      const extra =
        addProp === true ? addOptProp : addOptProp === true ? addProp : and(addProp, addOptProp)
      gen.if(extra, () => {
        if (it.opts.removeAdditional) {
          gen.code(_`delete ${data}[${key}]`)
        } else {
          cxt.error(
            false,
            {propError: PropError.Additional, additionalProperty: key},
            {instancePath: key, parentSchema: true}
          )
          if (!it.opts.allErrors) gen.break()
        }
      })
    })
  }

  function isAdditional(
    key: Name,
    props: string[],
    keyword: string,
    jtdDiscriminator?: string
  ): Code | true {
    let additional: Code | boolean
    if (props.length > 8) {
      // TODO maybe an option instead of hard-coded 8?
      const propsSchema = schemaRefOrVal(it, parentSchema[keyword], keyword)
      additional = not(isOwnProperty(gen, propsSchema as Code, key))
      if (jtdDiscriminator !== undefined) {
        additional = and(additional, _`${key} !== ${jtdDiscriminator}`)
      }
    } else if (props.length || jtdDiscriminator !== undefined) {
      const ps = jtdDiscriminator === undefined ? props : [jtdDiscriminator].concat(props)
      additional = and(...ps.map((p) => _`${key} !== ${p}`))
    } else {
      additional = true
    }
    return additional
  }
}

export default def
