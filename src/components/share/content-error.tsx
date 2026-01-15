import style from "./content-error.module.css"
import { type JSX, createSignal } from "solid-js"
import { createOverflow } from "./common"
import { useI18n } from "../../lib/i18n"

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
  expand?: boolean
}
export function ContentError(props: Props) {
  const { t } = useI18n()
  const [expanded, setExpanded] = createSignal(false)
  const overflow = createOverflow()

  return (
    <div class={style.root} data-expanded={expanded() || props.expand === true ? true : undefined}>
      <div data-section="content" ref={overflow.ref}>
        {props.children}
      </div>
      {((!props.expand && overflow.status) || expanded()) && (
        <button type="button" data-element-button-text onClick={() => setExpanded((e) => !e)}>
          {expanded() ? t().common.showLess : t().common.showMore}
        </button>
      )}
    </div>
  )
}
