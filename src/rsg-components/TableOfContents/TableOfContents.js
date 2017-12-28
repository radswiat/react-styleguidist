import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import ComponentsList from 'rsg-components/ComponentsList';
import TableOfContentsRenderer from 'rsg-components/TableOfContents/TableOfContentsRenderer';
import styleguide from 'store/styleguide';
import filterSectionsByName from '../../utils/filterSectionsByName';

@observer
export default class TableOfContents extends Component {

	static propTypes = {
		sections: PropTypes.array.isRequired,
	};

	static contextTypes = {
		config: PropTypes.object,
	};

	state = {
		searchTerm: '',
	};

	renderLevel(sections) {
		let items = sections.map(section => {
			const children = [...(section.sections || []), ...(section.components || [])];
			return Object.assign({}, section, {
				heading: !!section.name && children.length > 0,
				content: children.length > 0 && this.renderLevel(children),
			});
		});

		if (this.context.config.groups) {
			console.error('--------- filter ---------');
			console.log(styleguide.type);
			console.log(this.context.config.groups);
			items = items.filter((item) => this.context.config.groups[styleguide.type].pathRegExp.test(item.pathLine));
		}

		console.log(items);

		return <ComponentsList items={items} />;
	}

	renderSections() {
		const { searchTerm } = this.state;
		const { sections } = this.props;

		// If there is only one section, we treat it as a root section
		// In this case the name of the section won't be rendered and it won't get left padding
		const firstLevel = sections.length === 1 ? sections[0].components : sections;
		const filtered = filterSectionsByName(firstLevel, searchTerm);

		return this.renderLevel(filtered);
	}

	render() {
		const { searchTerm } = this.state;
		return (
			<div>
				{styleguide.type}
				<TableOfContentsRenderer
					searchTerm={searchTerm}
					onSearchTermChange={searchTerm => this.setState({ searchTerm })}
				>
					{this.renderSections()}
				</TableOfContentsRenderer>
			</div>
		);
	}
}
