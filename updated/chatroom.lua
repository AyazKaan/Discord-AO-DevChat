Handlers.add(
    "ToDiscord",
    Handlers.utils.hasMatchingTag("Action", "ToDiscord"),
    function(m)
        local userTag = m.Event or "Unknown"
        local x = userTag .. " from DC: " .. (m.Data or "No content")
        Say(x)
    end
)
