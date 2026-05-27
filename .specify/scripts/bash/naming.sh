#!/usr/bin/env bash
# naming.sh - Template-based naming system for spec-kit
# This module handles branch and folder name generation with configurable templates
#
# Usage:
#   source naming.sh
#   eval $(load_naming_config "/path/to/config.yaml")
#   eval $(compute_names "$description" "$seq" ...)

set -e

# ═══════════════════════════════════════════════════════════
# CONFIGURATION LOADING
# ═══════════════════════════════════════════════════════════

load_naming_config() {
    local config_file="$1"
    local config_branch_format=""
    local config_folder_format=""
    local config_validate_branch=""
    local config_auto_detect=""
    local config_default_type=""
    local config_identifier=""
    
    if [[ -f "$config_file" ]]; then
        config_branch_format=$(grep -E '^\s*branch_format:\s*' "$config_file" 2>/dev/null | head -1 | sed 's/^\s*branch_format:\s*//' | tr -d '"' | tr -d "'")
        config_folder_format=$(grep -E '^\s*folder_format:\s*' "$config_file" 2>/dev/null | head -1 | sed 's/^\s*folder_format:\s*//' | tr -d '"' | tr -d "'")
        config_validate_branch=$(grep -E '^\s*validate_branch:\s*' "$config_file" 2>/dev/null | head -1 | sed 's/^\s*validate_branch:\s*//' | tr -d '"' | tr -d "'")
        config_auto_detect=$(grep -E '^\s*auto_detect_type:\s*' "$config_file" 2>/dev/null | head -1 | sed 's/^\s*auto_detect_type:\s*//' | tr -d ' ')
        config_default_type=$(grep -E '^\s*default_type:\s*' "$config_file" 2>/dev/null | head -1 | sed 's/^\s*default_type:\s*//' | tr -d '"' | tr -d "'")
        config_identifier=$(grep -E '^\s*identifier:\s*' "$config_file" 2>/dev/null | head -1 | sed 's/^\s*identifier:\s*//' | tr -d '"' | tr -d "'")
    fi
    
    echo "CONFIG_BRANCH_FORMAT='${config_branch_format}'"
    echo "CONFIG_FOLDER_FORMAT='${config_folder_format}'"
    echo "CONFIG_VALIDATE_BRANCH='${config_validate_branch}'"
    echo "CONFIG_AUTO_DETECT='${config_auto_detect}'"
    echo "CONFIG_DEFAULT_TYPE='${config_default_type}'"
    echo "CONFIG_IDENTIFIER='${config_identifier}'"
}

# ═══════════════════════════════════════════════════════════
# TOKEN COMPUTATION
# ═══════════════════════════════════════════════════════════

detect_branch_type() {
    local description="$1"
    local fix_keywords="(fix|bug|repair|resolve|patch|correct|hotfix)"
    
    if echo "$description" | grep -qiE "^\s*${fix_keywords}\b"; then
        echo "fix"
    else
        echo "feature"
    fi
}

to_kebab_case() {
    local text="$1"
    echo "$text" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//'
}

generate_kebab_name() {
    local description="$1"
    
    local stop_words="^(i|a|an|the|to|for|of|in|on|at|by|with|from|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|should|could|can|may|might|must|shall|this|that|these|those|my|your|our|their|want|need|add|get|set)$"
    
    local clean_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/ /g')
    
    local meaningful_words=()
    for word in $clean_name; do
        [ -z "$word" ] && continue
        if ! echo "$word" | grep -qiE "$stop_words"; then
            if [ ${#word} -ge 3 ]; then
                meaningful_words+=("$word")
            elif echo "$description" | grep -q "\b${word^^}\b"; then
                meaningful_words+=("$word")
            fi
        fi
    done
    
    if [ ${#meaningful_words[@]} -gt 0 ]; then
        local max_words=3
        if [ ${#meaningful_words[@]} -eq 4 ]; then max_words=4; fi
        
        local result=""
        local count=0
        for word in "${meaningful_words[@]}"; do
            if [ $count -ge $max_words ]; then break; fi
            if [ -n "$result" ]; then result="$result-"; fi
            result="$result$word"
            count=$((count + 1))
        done
        echo "$result"
    else
        to_kebab_case "$description"
    fi
}

get_date_token() {
    date +%Y%m%d
}

# ═══════════════════════════════════════════════════════════
# TEMPLATE EXPANSION
# ═══════════════════════════════════════════════════════════

expand_template() {
    local template="$1"
    local type="$2"
    local ticket="$3"
    local seq="$4"
    local kebab="$5"
    local summary="$6"
    local date="$7"
    local branch="${8:-}"
    
    local result="$template"
    
    result="${result//\{type\}/$type}"
    result="${result//\{ticket\}/$ticket}"
    result="${result//\{seq\}/$seq}"
    result="${result//\{kebab\}/$kebab}"
    result="${result//\{summary\}/$summary}"
    result="${result//\{date\}/$date}"
    result="${result//\{branch\}/$branch}"
    
    result=$(echo "$result" | sed 's/-\+/-/g' | sed 's/^-//' | sed 's/-$//')
    
    echo "$result"
}

# ═══════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════

validate_branch_name() {
    local branch_name="$1"
    local pattern="$2"
    
    if [[ -z "$pattern" ]]; then
        return 0
    fi
    
    if [[ ! "$branch_name" =~ $pattern ]]; then
        echo "ERROR: Branch name '$branch_name' does not match validation pattern" >&2
        echo "Pattern: $pattern" >&2
        return 1
    fi
    
    return 0
}

# ═══════════════════════════════════════════════════════════
# MAIN NAME COMPUTATION
# ═══════════════════════════════════════════════════════════

compute_names() {
    local description="$1"
    local seq="$2"
    local config_branch_format="$3"
    local config_folder_format="$4"
    local config_validate_branch="$5"
    local config_auto_detect="$6"
    local config_default_type="$7"
    local config_identifier="$8"
    local cli_type="$9"
    local cli_ticket="${10:-}"
    local cli_short_name="${11:-}"
    
    local branch_type="$config_default_type"
    if [[ -n "$cli_type" ]]; then
        branch_type="$cli_type"
    elif [[ "$config_auto_detect" == "true" ]]; then
        branch_type=$(detect_branch_type "$description")
    fi
    
    local ticket="$config_identifier"
    if [[ -n "$cli_ticket" ]]; then
        ticket="$cli_ticket"
    fi
    
    local kebab
    if [[ -n "$cli_short_name" ]]; then
        kebab=$(to_kebab_case "$cli_short_name")
    else
        kebab=$(generate_kebab_name "$description")
    fi
    
    local summary=$(echo "$description" | tr '[:upper:]' '[:lower:]')
    local date=$(get_date_token)
    local seq_padded=$(printf "%03d" "$((10#$seq))")
    
    local branch_name=$(expand_template "$config_branch_format" "$branch_type" "$ticket" "$seq_padded" "$kebab" "$summary" "$date")
    
    if ! validate_branch_name "$branch_name" "$config_validate_branch"; then
        return 1
    fi
    
    local folder_path=$(expand_template "$config_folder_format" "$branch_type" "$ticket" "$seq_padded" "$kebab" "$summary" "$date" "$branch_name")
    
    echo "BRANCH_NAME='${branch_name}'"
    echo "FEATURE_DIR='${folder_path}'"
    echo "BRANCH_TYPE='${branch_type}'"
    echo "SEQ='${seq_padded}'"
    echo "KEBAB='${kebab}'"
    echo "TICKET='${ticket_full}'"
}

# ═══════════════════════════════════════════════════════════
# BRANCH PARSING (for finding existing features)
# ═══════════════════════════════════════════════════════════

extract_seq_from_branch() {
    local branch="$1"
    
    if [[ "$branch" =~ ([0-9]{3}) ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo ""
    fi
}

parse_branch_tokens() {
    local branch="$1"
    local type=""
    local ticket=""
    local seq=""
    local kebab=""
    
    if [[ "$branch" =~ ^(feature|fix)/(.+)$ ]]; then
        type="${BASH_REMATCH[1]}"
        local suffix="${BASH_REMATCH[2]}"
        
        if [[ "$suffix" =~ ([0-9]{3}) ]]; then
            seq="${BASH_REMATCH[1]}"
        fi
        
        if [[ "$suffix" =~ [0-9]{3}-(.+)$ ]]; then
            kebab="${BASH_REMATCH[1]}"
        fi
        
        if [[ "$suffix" =~ ^([A-Za-z]+)-[0-9]{3} ]]; then
            ticket="${BASH_REMATCH[1]}"
        fi
    elif [[ "$branch" =~ ^([0-9]{3})-(.+)$ ]]; then
        seq="${BASH_REMATCH[1]}"
        kebab="${BASH_REMATCH[2]}"
    fi
    
    echo "TYPE='${type}'"
    echo "TICKET='${ticket}'"
    echo "SEQ='${seq}'"
    echo "KEBAB='${kebab}'"
}
