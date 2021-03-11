import $ from 'jquery';

const classChecked = 'w--redirected-checked';

const $template = $('.filter-checkbox--dropdown')
  .removeClass('hidden')
  .removeAttr('id')
  .prop('checked', true);

export class FilterSelectOption {
  constructor($container, value, selected, callback) {
    this.$container = $container;
    this.value = value;
    this.selected = selected;
    this.callback = callback;
    this.render();
  }

  render() {
    const $option = $template.clone(true, true)
      .change({ value: this.value }, this.onChange.bind(this));
    if (this.selected === true) {
      $option.find('.w-checkbox-input')
        .addClass(classChecked);
    } else {
      $option.find('.w-checkbox-input')
        .removeClass(classChecked);
    }
    $option.find('.checkbox-label')
      .text(this.value);
    this.$checkDiv = $option.find('.w-checkbox-input');
    this.$container.append($option);
  }

  onChange(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.selected = !this.selected;
    if (this.selected) {
      this.$checkDiv.addClass(classChecked);
    } else {
      this.$checkDiv.removeClass(classChecked);
    }
    this.callback(this.value, this.selected);
  }
}
