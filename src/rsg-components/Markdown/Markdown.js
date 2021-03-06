import PropTypes from 'prop-types';
import { compiler } from 'markdown-to-jsx';
import mapValues from 'lodash/mapValues';
import memoize from 'lodash/memoize';
import Styled from 'rsg-components/Styled';
import Link from 'rsg-components/Link';
import Text from 'rsg-components/Text';
import Para, { styles as paraStyles } from 'rsg-components/Para';
import MarkdownBlockQuote from 'rsg-components/MarkdownBlockQuote';
import MarkdownHeading from 'rsg-components/Markdown/MarkdownHeading';
import InlineCode from 'rsg-components/InlineCode';
import OS from 'os';
import List from 'rsg-components/Markdown/List';

// We’re explicitly specifying Webpack loaders here so we could skip specifying them in Webpack configuration.
// That way we could avoid clashes between our loaders and user loaders.
// eslint-disable-next-line import/no-unresolved
require('!!../../../loaders/style-loader!../../../loaders/css-loader!highlight.js/styles/tomorrow.css');

// Custom CSS classes for each tag: <em> → <em className={s.em}> + custom components
const getBaseOverrides = memoize((classes) => {
	const styleOverrides = mapValues(classes, value => ({
		props: {
			className: value,
		},
	}));

	return {
		...styleOverrides,
		a: {
			component: Link,
		},
		h1: {
			component: MarkdownHeading,
			props: {
				level: 1,
			},
		},
		h2: {
			component: MarkdownHeading,
			props: {
				level: 2,
			},
		},
		h3: {
			component: MarkdownHeading,
			props: {
				level: 3,
			},
		},
		h4: {
			component: MarkdownHeading,
			props: {
				level: 4,
			},
		},
		h5: {
			component: MarkdownHeading,
			props: {
				level: 5,
			},
		},
		h6: {
			component: MarkdownHeading,
			props: {
				level: 6,
			},
		},
		p: {
			component: Para,
			props: {
				semantic: 'p',
			},
		},
		em: {
			component: Text,
			props: {
				semantic: 'em',
			},
		},
		blockquote: {
			component: MarkdownBlockQuote,
			props: {
				isRhs: false,
			},
		},
		strong: {
			component: Text,
			props: {
				semantic: 'strong',
			},
		},
		ul: {
			component: List,
		},
		ol: {
			component: List,
			props: {
				ordered: true,
			},
		},
		code: {
			component: InlineCode,
			props: {
				className: classes.code,
			},
		},
	};
}, () => 'getBaseOverrides');

// Inline mode: replace <p> (usual root component) with <span>
const getInlineOverrides = memoize(classes => {
	const overrides = getBaseOverrides(classes);

	return {
		...overrides,
		p: {
			component: Text,
		},
	};
}, () => 'getInlineOverrides');

const styles = ({ space, fontFamily, fontSize, color, borderRadius }) => ({
	base: {
		color: color.base,
		fontFamily: fontFamily.base,
		fontSize: 'inherit',
	},
	para: paraStyles({ space, color, fontFamily }).para,
	input: {
		isolate: false,
		display: 'inline-block',
		verticalAlign: 'middle',
	},
	hr: {
		composes: '$para',
		borderWidth: [[0, 0, 1, 0]],
		borderColor: color.border,
		borderStyle: 'solid',
	},
	code: {
		fontFamily: fontFamily.monospace,
		fontSize: 'inherit',
		color: 'inherit',
		background: 'transparent',
		whiteSpace: 'inherit',
	},
	pre: {
		composes: '$para',
		backgroundColor: color.codeBackground,
		border: [[1, color.border, 'solid']],
		padding: [[space[1], space[2]]],
		fontSize: fontSize.small,
		borderRadius,
		whiteSpace: 'pre',
	},
	table: {
		composes: '$para',
		borderCollapse: 'collapse',
	},
	thead: {
		composes: '$hr',
	},
	tbody: {},
	td: {
		fontFamily: fontFamily.base,
		padding: [[space[0], space[2], space[0], 0]],
		fontSize: fontSize.base,
	},
	th: {
		composes: '$td',
		fontWeight: 'bold',
	},
	tr: {},
});

function Markdown({ classes, text, inline }) {
	const overrides = inline ? getInlineOverrides(classes) : getBaseOverrides(classes);
	return compiler(text, { overrides, forceBlock: true });
}

// instead of rendering, return as array outside of react component rendering way
export function asArrayMarkdown({ text }) {
	const markdowns = [];
	text.map((example) => {
		const rhs = example.content.split(OS.EOL).filter((line) => /^(>)([\s\w\W]+)$/.test(line));
		console.log(rhs);
		rhs.map((rhsText) => {
			markdowns.push(compiler(rhsText, { overrides: {
					blockquote: {
						component: MarkdownBlockQuote,
						props: {
							isRhs: true,
						},
					},
				}, forceBlock: true }));
		});
	});
	return markdowns;
}

Markdown.propTypes = {
	classes: PropTypes.object.isRequired,
	text: PropTypes.string.isRequired,
	inline: PropTypes.bool,
};

export default Styled(styles)(Markdown);
